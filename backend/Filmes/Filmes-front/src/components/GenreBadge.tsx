interface GenreBadgeProps {
  genre: string;
}

const GenreBadge = ({ genre }: GenreBadgeProps) => {
  return (
    <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 text-primary">
      {genre}
    </span>
  );
};

export default GenreBadge;
