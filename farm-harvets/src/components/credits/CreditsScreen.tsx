
import BackButton from '../ui/BackButton';

interface CreditsScreenProps {
  onBack: () => void;
}

const CreditsScreen: React.FC<CreditsScreenProps> = ({ onBack }) => {
  const credits = [
    {
      role: 'Desarrollo',
      people: ['Tu Nombre', 'Claude AI Assistant'],
    },
    {
      role: 'Diseño UI/UX',
      people: ['Tu Nombre'],
    },
    {
      role: 'Programación',
      people: ['React + TypeScript', 'Vite', 'Tailwind CSS'],
    },
    {
      role: 'Música y Sonido',
      people: ['Pendiente'],
    },
    {
      role: 'Agradecimientos Especiales',
      people: ['Comunidad Open Source', 'Anthropic'],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12">
      {/* Título */}
      <div className="mb-12 text-center animate-fade-in">
        <h2 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4 text-glow">
          CRÉDITOS
        </h2>
        <p className="text-secondary text-xl">
          XLR Harvest Game Menu System
        </p>
      </div>

      {/* Contenedor de créditos con scroll */}
      <div className="w-full max-w-2xl max-h-[60vh] overflow-y-auto space-y-8 mb-12 custom-scrollbar">
        {credits.map((section, index) => (
          <div
            key={section.role}
            className="card animate-slide-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="font-display text-2xl text-primary mb-3 tracking-wider">
              {section.role}
            </h3>
            <div className="space-y-2">
              {section.people.map((person) => (
                <p key={person} className="text-white text-lg">
                  {person}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Mensaje final */}
        <div className="text-center py-8 animate-fade-in delay-500">
          <p className="text-3xl mb-4">🎮</p>
          <p className="text-secondary text-lg italic">
            "Gracias por jugar"
          </p>
          <p className="text-muted text-sm mt-4">
            © 2025 XLR Harvest. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Botón de regreso */}
      <BackButton onClick={onBack} />
    </div>
  );
};

export default CreditsScreen;