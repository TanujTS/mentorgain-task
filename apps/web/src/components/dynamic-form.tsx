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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DynamicFormProps {
    fields: FormField[];
    onSubmit: (values: any) => void;
    isLoading?: boolean;
    submitLabel?: string;
}

export function DynamicForm({ fields, onSubmit, isLoading, submitLabel = "Submit" }: DynamicFormProps) {
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
                // For now, handling file as string (URL) or mock
                fieldSchema = z.any();
                if (field.isRequired) fieldSchema = z.any();
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
                    response.fileResponse = value as string; // Assuming file upload endpoint returns URL separately
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
                                <FormControl>
                                    {field.fieldType === 'text' && (
                                        <Input {...formFieldProps} value={formFieldProps.value as string || ''} placeholder={field.description} />
                                    )}
                                    {field.fieldType === 'number' && (
                                        <Input type="number" {...formFieldProps} value={formFieldProps.value as string || ''} placeholder={field.description} />
                                    )}
                                    {field.fieldType === 'select' && (
                                        <Select onValueChange={formFieldProps.onChange} defaultValue={formFieldProps.value as string}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {field.options?.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {/* Multi-select and File pending full UI impl */}
                                </FormControl>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && "Loading..."}
                    {!isLoading && submitLabel}
                </Button>
            </form>
        </Form>
    );
}
