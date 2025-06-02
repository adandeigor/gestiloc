import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star } from 'lucide-react';
import AvatarInitials from './avatar-initials';

interface TestimonialCardProps {
  quote: string;
  initials: string;
  name: string;
  title: string;
  stars: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, initials, name, title, stars }) => {
  return (
    <Card className="flex flex-col bg-gray-200 shadow-md border-none rounded-lg p-6 hover:shadow-lg duration-400 ease-in-out cursor-pointer hover:scale-105 transition-all">
      <CardContent className="flex flex-col gap-4">
        {/* Étoiles */}
        <div className="flex gap-1">
          {[...Array(stars)].map((_, index) => (
            <Star key={index} className="h-5 w-5 text-accent" />
          ))}
        </div>
        {/* Témoignage */}
        <p className="text-gray-600 montserrat-regular text-sm md:text-base">{quote}</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <div className="flex flex-row items-center justify-start gap-3">
          <AvatarInitials initials={initials} />
          <div className="flex flex-col">
            <span className="text-primary montserrat-bold text-sm">{name}</span>
            <span className="text-gray-500 montserrat-regular text-xs">{title}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TestimonialCard;