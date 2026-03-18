interface Props {
  videoUrl: string;
}

export function PlayerVideoDemo({ videoUrl }: Props) {
  return (
    <div className="w-full max-w-xs mx-auto rounded-xl overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full aspect-video object-cover"
        aria-label="Démonstration de l'exercice"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
}
