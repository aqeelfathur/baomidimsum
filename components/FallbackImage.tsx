import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export default function FallbackImage(props: ImageProps) {
  const { src, alt, ...rest } = props;
  const [currentSrc, setCurrentSrc] = useState<ImageProps["src"]>(src);

  return (
    <Image
      {...(rest as ImageProps)}
      src={currentSrc}
      alt={(alt as string) || "image"}
      onError={() => {
        if (currentSrc !== "/notfound.webp") {
          setCurrentSrc("/notfound.webp");
        }
      }}
    />
  );
}
