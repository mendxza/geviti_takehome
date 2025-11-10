import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Schema = z.object({
  sqft: z.coerce.number().int().min(1, "Must be ≥ 1"),
  bedrooms: z.coerce.number().int().min(0, "Must be ≥ 0"),
});

export type PredictionFormValues = z.infer<typeof Schema>;

export default function PredictionForm({
  onSubmit,
}: {
  onSubmit?: (values: PredictionFormValues) => Promise<void> | void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: PredictionFormValues) => {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed with status ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(Schema),
    mode: "onTouched",
    defaultValues : {sqft: 1000, bedrooms: 2}
  });

  const handleSubmit = form.handleSubmit(async (vals) => {
    if (onSubmit) return onSubmit(vals);
    try {
      await mutation.mutateAsync(vals);
      form.reset();
    } catch (err) {
      console.error(err);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border p-6 shadow-sm">
        <FormField
          control={form.control}
          name="sqft"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Square Footage</FormLabel>
              <FormControl>
                <Input type="number" inputMode="numeric" step={1} min={1} placeholder="1800" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <Input type="number" inputMode="numeric" step={1} min={0} placeholder="3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting || mutation.isLoading}>
            {mutation.isLoading ? "Submitting..." : "Get Prediction"}
          </Button>
        </div>
      </form>
    </Form>
  );
}