"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormField } from "@/services/programs.service";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { formsService } from "@/services/forms.service";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DynamicFormProps {
    fields: FormField[];
    onSubmit: (values: any) => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function DynamicForm({ fields, onSubmit, isLoading, submitLabel = "Submit" }: DynamicFormProps) {
    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    // Dynamically build Zod schema
    const schemaShape: any = {};

    fields.forEach((field) => {
        let fieldSchema;

        switch (field.fieldType) {
            case 'number':
                // Handle number inputs: string from input -> transform to number
                fieldSchema = z.string().or(z.number());
                if (field.isRequired) {
                    fieldSchema = z.union([z.string().min(1, "Required"), z.number()]).transform((val) => Number(val));
                } else {
                    fieldSchema = z.union([z.string(), z.number()]).optional().transform(v => v ? Number(v) : undefined);
                }
                break;
            case 'multi_select':
                fieldSchema = z.array(z.string());
                if (field.isRequired) fieldSchema = fieldSchema.min(1, "Select at least one option");
                break;
            case 'file':
                fieldSchema = z.string().optional();
                if (field.isRequired) {
                    fieldSchema = z.string().min(1, "File is required");
                }
                break;
            default: // text, select
                fieldSchema = z.string();
                if (field.isRequired) fieldSchema = fieldSchema.min(1, "Required");
                else fieldSchema = fieldSchema.optional();
        }

        schemaShape[field.id] = fieldSchema;
    });

    const formSchema = z.object(schemaShape);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(prev => ({ ...prev, [fieldId]: true }));
            const url = await formsService.uploadFile(file);
            const urlString = String(url);
            form.setValue(fieldId, urlString, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            await form.trigger(fieldId);
            form.clearErrors(fieldId);
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error(error);
            toast.error("File upload failed", { description: "Please try again with a different file." });
        } finally {
            setUploading(prev => ({ ...prev, [fieldId]: false }));
        }
    };

    const handleSubmit = (values: any) => {
        // Transform values to array of responses expected by backend
        const formattedResponses = Object.entries(values).map(([fieldId, value]) => {
            const field = fields.find(f => f.id === fieldId);
            if (!field) return null;

            const response: any = { formFieldId: fieldId };

            switch (field.fieldType) {
                case 'number':
                    response.numberResponse = Number(value);
                    break;
                case 'multi_select':
                    response.multiSelectResponse = value as string[];
                    break;
                case 'file':
                    response.fileResponse = value as string;
                    break;
                case 'select':
                    response.selectResponse = value as string;
                    break;
                default:
                    response.textResponse = value as string;
            }
            return response;
        }).filter(Boolean);

        onSubmit(formattedResponses);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {fields.sort((a, b) => a.order - b.order).map((field) => (
                    <UIFormField
                        key={field.id}
                        control={form.control}
                        name={field.id}
                        render={({ field: formFieldProps }) => (
                            <FormItem>
                                <FormLabel>{field.title} {field.isRequired && "*"}</FormLabel>
                                {field.fieldType === 'text' && (
                                    <FormControl>
                                        <Input {...formFieldProps} value={formFieldProps.value as string || ''} placeholder={field.description} />
                                    </FormControl>
                                )}
                                {field.fieldType === 'number' && (
                                    <FormControl>
                                        <Input type="number" {...formFieldProps} value={formFieldProps.value as string || ''} placeholder={field.description} />
                                    </FormControl>
                                )}
                                {field.fieldType === 'select' && (
                                    <Select onValueChange={formFieldProps.onChange} defaultValue={formFieldProps.value as string}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {field.options && field.options.length > 0 ? (
                                                field.options.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground">No options available</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                                {field.fieldType === 'multi_select' && (
                                    <FormControl>
                                        <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                                            {field.options && field.options.length > 0 ? (
                                                field.options.map((option) => (
                                                    <div key={option} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${field.id}-${option}`}
                                                            checked={(formFieldProps.value as string[] || []).includes(option)}
                                                            onCheckedChange={(checked) => {
                                                                const current = (formFieldProps.value as string[]) || [];
                                                                if (checked) {
                                                                    formFieldProps.onChange([...current, option]);
                                                                } else {
                                                                    formFieldProps.onChange(current.filter((val) => val !== option));
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`${field.id}-${option}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {option}
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No options available</div>
                                            )}
                                        </div>
                                    </FormControl>
                                )}
                                {field.fieldType === 'file' && (
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="file"
                                                className="file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-sm file:font-semibold"
                                                onChange={(e) => handleFileChange(e, field.id)}
                                                disabled={uploading[field.id]}
                                            />
                                            {uploading[field.id] && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                            {/* Hidden input to hold the actual value (URL) for validation */}
                                            <input
                                                type="hidden"
                                                {...formFieldProps}
                                                value={formFieldProps.value as string || ''}
                                            />
                                        </div>
                                    </FormControl>
                                )}

                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}

                <Button type="submit" className="w-full" disabled={isLoading || Object.values(uploading).some(Boolean)}>
                    {isLoading && "Loading..."}
                    {!isLoading && submitLabel}
                </Button>
            </form>
        </Form>
    );
}
