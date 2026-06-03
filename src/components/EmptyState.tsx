import mascotSearching from '@/assets/Mascot Optional CS6-01.png';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
}

export function EmptyState({
    title = "Tidak ada data ditemukan",
    description = "Mascot kami sedang mencari, tapi sepertinya belum ada apa-apa di sini.",
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in", className)}>
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150" />
                <img
                    src={mascotSearching}
                    alt="Searching Mascot"
                    className="relative h-40 sm:h-48 w-auto object-contain drop-shadow-xl animate-bounce-subtle"
                />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {description}
            </p>
        </div>
    );
}
