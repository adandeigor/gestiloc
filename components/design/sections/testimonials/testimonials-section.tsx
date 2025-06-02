import TestimonialCard from "./testimonials-card";
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      "Depuis que j'utilise GestiLoc, la gestion de mes 12 appartements est devenue un jeu d'enfant. Je gagne un temps précieux et mes locataires apprécient la communication simplifiée.",
    initials: 'ML',
    name: 'Marie Leclerc',
    title: 'Propriétaire à Lyon',
    stars: 5,
  },
  {
    quote:
      'Le suivi financier est impressionnant. Je peux enfin avoir une vision claire de la rentabilité de chacun de mes biens et prendre des décisions éclairées pour mes investissements futurs.',
    initials: 'PD',
    name: 'Philippe Durand',
    title: 'Investisseur à Paris',
    stars: 5,
  },
  {
    quote:
      "En tant qu'agence immobilière, GestiLoc nous a permis d'optimiser notre service de gestion locative. Nos clients propriétaires sont ravis et notre équipe est plus efficace.",
    initials: 'SB',
    name: 'Sophie Bertrand',
    title: "Directrice d'agence à Bordeaux",
    stars : 4
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="py-16 bg-white"
    >
      <div className="max-w-screen-xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4 montserrat-bold">
          Ce que nos clients disent
        </h2>
        <p className="text-center text-gray-600 mb-12 lato-regular max-w-2xl mx-auto">
          Découvrez comment GestiLoc a transformé la gestion locative de nos clients.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              initials={testimonial.initials}
              name={testimonial.name}
              title={testimonial.title}
              stars={testimonial.stars}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;