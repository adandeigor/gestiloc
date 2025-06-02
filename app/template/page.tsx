// app/templates/editor/page.tsx
'use client';

import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import BlockPalette from '@/components/template-editor/BlockPalette';
import PropertiesPanel from '@/components/template-editor/PropertiesPanel';
import Canvas from '@/components/template-editor/Canvas';
import { TemplateSchema } from '@/validators/template.validator';

interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface Template {
  name: string;
  type: string;
  structure: {
    globalStyles: {
      font?: string;
      primaryColor?: string;
      margins?: { top?: number; bottom?: number; left?: number; right?: number };
    };
    blocks: Block[];
  };
}

export default function TemplateEditor() {
  const [template, setTemplate] = useState<Template>({
    name: 'Nouveau Template',
    type: 'invoice',
    structure: {
      globalStyles: { font: 'Arial', primaryColor: '#000000', margins: { top: 20, bottom: 20 } },
      blocks: [],
    },
  });
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Cas 1 : Réorganisation des blocs dans le canvas
    if (active.id !== over?.id && !String(active.id).startsWith('draggable-')) {
      const oldIndex = template.structure.blocks.findIndex((block) => block.id === active.id);
      const newIndex = template.structure.blocks.findIndex((block) => block.id === over?.id);
      setTemplate({
        ...template,
        structure: {
          ...template.structure,
          blocks: arrayMove(template.structure.blocks, oldIndex, newIndex),
        },
      });
    }

    // Cas 2 : Ajout d'un nouveau bloc depuis la palette
    if (String(active.id).startsWith('draggable-') && over?.id) {
      const type = active.data.current?.type;
      if (type) {
        const newBlock: Block = {
          id: `block-${Date.now()}`,
          type,
          props: { text: '', align: 'left', color: '#000000' },
        };
        const overIndex = template.structure.blocks.findIndex((block) => block.id === over.id);
        const newBlocks = [...template.structure.blocks];
        newBlocks.splice(overIndex + 1, 0, newBlock);
        setTemplate({
          ...template,
          structure: { ...template.structure, blocks: newBlocks },
        });
      }
    }
  };

  const handleSave = async () => {
    const parsed = TemplateSchema.safeParse(template);
    if (!parsed.success) {
      alert('Erreur de validation : ' + JSON.stringify(parsed.error.flatten()));
      return;
    }

    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });

    if (response.ok) {
      alert('Template sauvegardé !');
    } else {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="flex h-screen">
      <PropertiesPanel
        template={template}
        setTemplate={setTemplate}
        selectedBlock={selectedBlock}
        setSelectedBlock={setSelectedBlock}
        className="w-1/4 p-4 bg-gray-50 border-r"
      />
      <div className="flex-1 p-4">
        <div className="mb-4 flex justify-between">
          <h1 className="text-2xl font-bold">Éditeur de Template</h1>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </div>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={template.structure.blocks.map((block) => block.id)}>
            <Canvas
              blocks={template.structure.blocks}
              setBlocks={(blocks) =>
                setTemplate({ ...template, structure: { ...template.structure, blocks } })
              }
              onSelectBlock={setSelectedBlock}
            />
          </SortableContext>
        </DndContext>
      </div>
      <BlockPalette
        onAddBlock={(type) => {
          const newBlock: Block = {
            id: `block-${Date.now()}`,
            type,
            props: { text: '', align: 'left', color: '#000000' },
          };
          setTemplate({
            ...template,
            structure: { ...template.structure, blocks: [...template.structure.blocks, newBlock] },
          });
        }}
        className="w-1/5 p-4 bg-gray-50 border-l"
      />
    </div>
  );
}
