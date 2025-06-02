import { FeaturesListProps } from "./features-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const FeatureCard = ({ title, description, icon:Icon }: FeaturesListProps) => {
    return (
        <Card className="w-full max-w-sm mx-auto my-4 card hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out cursor-pointer">
            <CardHeader className="flex flex-col items-start gap-5">
                <div className="flex items-center">
                    <Icon className="h-8 w-8 text-secondary mr-2" />
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-sm font-mono">{description}</CardDescription>
            </CardContent>
            <CardFooter>
                {/* Add any footer content here if needed */}
            </CardFooter>
        </Card>
    )
}
export default FeatureCard;
