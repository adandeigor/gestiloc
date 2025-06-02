import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
}

interface CanvasProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
  onSelectBlock: (block: Block) => void;
}

export default function Canvas({ blocks, setBlocks, onSelectBlock }: CanvasProps) {
  return (
    <div className="p-4 bg-white border rounded min-h-[500px]">
      {blocks.length === 0 && <p className="text-gray-500">Ajoutez des blocs pour commencer</p>}
      {blocks.map((block) => (
        <SortableBlock
          key={block.id}
          block={block}
          onSelect={() => onSelectBlock(block)}
        />
      ))}
    </div>
  );
}

function SortableBlock({ block, onSelect }: { block: Block; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 mb-2 bg-gray-100 border rounded cursor-move"
      onClick={onSelect}
    >
      {block.type === 'TextBlock' && <p>{block.props.text || 'Texte personnalisé'}</p>}
      {block.type === 'TableBlock' && <div>Tableau des articles</div>}
      {block.type === 'ClientInfoBlock' && <div>Informations client</div>}
      {block.type === 'TotalBlock' && <div>Total final</div>}
      {block.type === 'FooterBlock' && <div>Notes de bas de page</div>}
      {block.type === 'LogoBlock' && <div>Logo</div>}
    </div>
  );
}
