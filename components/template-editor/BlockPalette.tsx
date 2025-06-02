// components/template-editor/BlockPalette.tsx
import { Button } from '@/components/ui/button';

interface BlockPaletteProps {
  onAddBlock: (type: string) => void;
  className?: string;
}

export default function BlockPalette({ onAddBlock, className }: BlockPaletteProps) {
  const availableBlocks = [
    { type: 'TextBlock', label: 'Titre' },
    { type: 'TableBlock', label: 'Tableau des articles' },
    { type: 'ClientInfoBlock', label: 'Infos client' },
    { type: 'TotalBlock', label: 'Total' },
    { type: 'FooterBlock', label: 'Notes de bas de page' },
    { type: 'LogoBlock', label: 'Logo' },
  ];

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">Blocs disponibles</h2>
      {availableBlocks.map((block) => (
        <Button
          key={block.type}
          variant="outline"
          className="w-full mb-2"
          onClick={() => onAddBlock(block.type)}
        >
          {block.label}
        </Button>
      ))}
    </div>
  );
}