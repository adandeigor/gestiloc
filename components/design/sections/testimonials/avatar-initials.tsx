interface AvatarInitialsProps {
    initials: string;
}

const AvatarInitials: React.FC<AvatarInitialsProps> = ({ initials }) => {
    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-white montserrat-bold text-sm">
            {initials}
        </div>
    );
};

export default AvatarInitials;
