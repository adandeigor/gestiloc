'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Template } from '@/app/template/page';

interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}
interface PropertiesPanelProps {
  template: Template;
  setTemplate: (template: Template) => void;
  selectedBlock: Block | null;
  setSelectedBlock: (block: Block | null) => void;
  className?: string;
}

const GlobalStylesSchema = z.object({
  font: z.string().optional(),
  primaryColor: z.string().optional(),
  margins: z
    .object({
      top: z.number().optional(),
      bottom: z.number().optional(),
    })
    .optional(),
});

const BlockPropsSchema = z.object({
  text: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  color: z.string().optional(),
});

export default function PropertiesPanel({
  template,
  setTemplate,
  selectedBlock,
  setSelectedBlock,
  className,
}: PropertiesPanelProps) {
  const globalForm = useForm({
    resolver: zodResolver(GlobalStylesSchema),
    defaultValues: template.structure.globalStyles,
  });

  const blockForm = useForm({
    resolver: zodResolver(BlockPropsSchema),
    defaultValues: selectedBlock?.props || {},
  });

  const onGlobalSubmit = (data: any) => {
    setTemplate({
      ...template,
      structure: { ...template.structure, globalStyles: data },
    });
  };

  const onBlockSubmit = (data: any) => {
    if (selectedBlock) {
      setTemplate({
        ...template,
        structure: {
          ...template.structure,
          blocks: template.structure.blocks.map((b) =>
            b.id === selectedBlock.id ? { ...b, props: data } : b
          ),
        },
      });
      setSelectedBlock({ ...selectedBlock, props: data });
    }
  };

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">Personnalisation</h2>

      {/* Formulaire pour les styles globaux */}
      <Form {...globalForm}>
        <form onSubmit={globalForm.handleSubmit(onGlobalSubmit)} className="space-y-4">
          <FormField
            control={globalForm.control}
            name="font"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Police</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une police" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={globalForm.control}
            name="primaryColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur principale</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={globalForm.control}
            name="margins.top"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marge supérieure</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Appliquer</Button>
        </form>
      </Form>

      {/* Formulaire pour les propriétés du bloc sélectionné */}
      {selectedBlock && (
        <Form {...blockForm}>
          <form onSubmit={blockForm.handleSubmit(onBlockSubmit)} className="mt-6 space-y-4">
            <h3 className="text-md font-medium">Propriétés du bloc : {selectedBlock.type}</h3>
            {selectedBlock.type === 'TextBlock' && (
              <>
                <FormField
                  control={blockForm.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texte</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={blockForm.control}
                  name="align"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alignement</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un alignement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Gauche</SelectItem>
                            <SelectItem value="center">Centré</SelectItem>
                            <SelectItem value="right">Droite</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={blockForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur du texte</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button type="submit">Appliquer</Button>
          </form>
        </Form>
      )}
    </div>
  );
}