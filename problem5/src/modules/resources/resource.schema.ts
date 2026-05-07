import { z } from "zod";

export const ResourceStatus = z.enum(["active", "inactive"]);

const NameSchema = z.string().trim().min(1).max(120);
const DescriptionSchema = z.string().trim().max(1000);

export const CreateResourceSchema = z.object({
  name: NameSchema,
  description: DescriptionSchema.optional().default(""),
  status: ResourceStatus.optional().default("active")
});

export const UpdateResourceSchema = z
  .object({
    name: NameSchema.optional(),
    description: DescriptionSchema.optional(),
    status: ResourceStatus.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export const ListResourcesQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  status: ResourceStatus.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().trim().min(1).max(256).optional()
});

export const IdParamSchema = z.object({
  id: z.string().uuid()
});

export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
export type ListResourcesQuery = z.infer<typeof ListResourcesQuerySchema>;
export type ResourceStatus = z.infer<typeof ResourceStatus>;
