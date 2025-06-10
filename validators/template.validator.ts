import { z } from 'zod';
// Schéma Zod pour valider la structure d'un bloc
const BlockSchema = z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.any()), // Props flexibles pour différents types de blocs
});

// Schéma Zod pour valider le champ structure
const StructureSchema = z.object({
    globalStyles: z
        .object({
            font: z.string().optional(),
            primaryColor: z.string().optional(),
            margins: z
                .object({
                    top: z.number().optional(),
                    bottom: z.number().optional(),
                    left: z.number().optional(),
                    right: z.number().optional(),
                })
                .optional(),
        })
        .optional(),
    blocks: z.array(BlockSchema).refine(
        blocks => {
            const requiredBlocks = [
                'TableBlock',
                'TotalBlock',
                'ClientInfoBlock',
            ];
            const blockTypes = blocks.map(block => block.type);
            return requiredBlocks.every(type => blockTypes.includes(type));
        },
        {
            message:
                'Missing required blocks (TableBlock, TotalBlock, ClientInfoBlock)',
        }
    ),
});

// Schéma Zod pour la création et la mise à jour d'un template
const TemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required'),
    type: z.enum(['invoice', 'quote', 'receipt'], {
        errorMap: () => ({
            message: 'Type must be invoice, quote, or receipt',
        }),
    }),
    structure: StructureSchema,
});

export { TemplateSchema, BlockSchema, StructureSchema };
export type TemplateType = z.infer<typeof TemplateSchema>;
export type BlockType = z.infer<typeof BlockSchema>;
export type StructureType = z.infer<typeof StructureSchema>;
