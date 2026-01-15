"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateProgramDto, FormField, programsService } from "@/services/programs.service";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField as UIFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const formFieldSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    fieldType: z.enum(['text', 'number', 'select', 'multi_select', 'file']),
    options: z.string().optional(), // Comma separated for input, transformed on submit
    isRequired: z.boolean(),
    order: z.number(),
});

const createProgramSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    // Keep as string for form handling, transform to number on submit
    maxParticipants: z.string().min(1, "Required"),
    formFields: z.array(formFieldSchema).optional(),
});

type CreateProgramFormValues = z.infer<typeof createProgramSchema>;

export function CreateProgramDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<CreateProgramFormValues>({
        resolver: zodResolver(createProgramSchema),
        defaultValues: {
            maxParticipants: "10",
            formFields: [],
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "formFields",
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateProgramDto) => programsService.create(data),
        onSuccess: () => {
            toast.success("Program Created", { description: "The mentorship program has been created successfully." });
            setOpen(false);
            form.reset();
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
        onError: () => {
            toast.error("Failed to create program");
        }
    });

    const onSubmit = (values: CreateProgramFormValues) => {
        // Transform options string to array and dates to ISO
        const payload: CreateProgramDto = {
            ...values,
            maxParticipants: Number(values.maxParticipants),
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
            formFields: values.formFields?.map((f, index) => ({
                ...f,
                order: index,
                options: f.options ? f.options.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                fieldType: f.fieldType as any,
            }))
        };
        createMutation.mutate(payload);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Create Mentorship Program</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <UIFormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Program Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Summer Mentorship 2025" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <UIFormField
                                    control={form.control}
                                    name="maxParticipants"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Max Participants</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <UIFormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Describe the program..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <UIFormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <UIFormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Application Form Fields</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ title: "", fieldType: "text", isRequired: false, order: fields.length })}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Field
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-4 rounded-md bg-muted/20">
                                        <div className="col-span-11 grid grid-cols-2 gap-4">
                                            <UIFormField
                                                control={form.control}
                                                name={`formFields.${index}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Field Title</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Question..." />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <UIFormField
                                                control={form.control}
                                                name={`formFields.${index}.fieldType`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="text">Text</SelectItem>
                                                                <SelectItem value="number">Number</SelectItem>
                                                                <SelectItem value="select">Select</SelectItem>
                                                                <SelectItem value="multi_select">Multi-Select</SelectItem>
                                                                <SelectItem value="file">File Upload</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Show options only for select types */}
                                            {(form.watch(`formFields.${index}.fieldType`) === 'select' || form.watch(`formFields.${index}.fieldType`) === 'multi_select') && (
                                                <UIFormField
                                                    control={form.control}
                                                    name={`formFields.${index}.options`}
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                            <FormLabel className="text-xs">Options (comma separated)</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} placeholder="Option A, Option B, Option C" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            <UIFormField
                                                control={form.control}
                                                name={`formFields.${index}.isRequired`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal text-xs">
                                                            Required?
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="col-span-1 text-destructive"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Program
                            </Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
