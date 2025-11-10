package main

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"sync"
	"syscall"
)

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "install":
		check(runInstall())
	case "dev":
		check(runDev())
	case "migrate":
		check(runMigrate())
	case "db:up":
		check(runDBUp())
	case "db:down":
		check(runDBDown())
	default:
		usage()
		os.Exit(1)
	}
}

func usage() {
	fmt.Println("Usage: go run . <command>")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  install   Install npm dependencies in server/ and ui/")
	fmt.Println("  db:up     Start the local Postgres container (docker compose)")
	fmt.Println("  db:down   Stop the local Postgres container")
	fmt.Println("  migrate   Run Prisma migrations (server)")
	fmt.Println("  dev       Run server and ui dev servers concurrently")
}

func check(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func runInstall() error {
	if err := runCmd("server", "npm", "install"); err != nil {
		return err
	}
	if err := runCmd("ui", "npm", "install"); err != nil {
		return err
	}
	return nil
}

func runMigrate() error {
	return runCmd("server", "npm", "run", "prisma:migrate")
}

func runDBUp() error {
	return runCmd(".", "docker", "compose", "-f", "server/docker-compose.yml", "up", "-d")
}

func runDBDown() error {
	return runCmd(".", "docker", "compose", "-f", "server/docker-compose.yml", "down", "-v")
}


func runDev() error {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	type process struct {
		name string
		cmd  *exec.Cmd
	}

	procs := []process{
		{
			name: "server",
			cmd:  command(ctx, "server", "npm", "run", "dev"),
		},
		{
			name: "ui",
			cmd:  command(ctx, "ui", "npm", "run", "dev"),
		},
	}

	errs := make(chan error, len(procs))
	var wg sync.WaitGroup

	for _, p := range procs {
		if err := p.cmd.Start(); err != nil {
			cancel()
			return fmt.Errorf("%s: %w", p.name, err)
		}
		fmt.Printf("[%s] started (pid %d)\n", p.name, p.cmd.Process.Pid)

		wg.Add(1)
		go func(pr process) {
			defer wg.Done()
			if err := pr.cmd.Wait(); err != nil && !errors.Is(err, context.Canceled) {
				errs <- fmt.Errorf("%s: %w", pr.name, err)
				cancel()
			}
		}(p)
	}

	go func() {
		wg.Wait()
		close(errs)
	}()

	<-ctx.Done()

	var firstErr error
	for err := range errs {
		if firstErr == nil {
			firstErr = err
		} else {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
		}
	}
	return firstErr
}

func command(ctx context.Context, dir string, name string, args ...string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, name, args...)
	cmd.Dir = dirPath(dir)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Env = os.Environ()
	return cmd
}

func runCmd(dir, name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Dir = dirPath(dir)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func dirPath(dir string) string {
	if filepath.IsAbs(dir) {
		return dir
	}
	root, err := os.Getwd()
	if err != nil {
		return dir
	}
	if dir == "." {
		return root
	}
	return filepath.Join(root, dir)
}
