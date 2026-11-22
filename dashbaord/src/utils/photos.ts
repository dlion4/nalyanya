export const photoSrcSet = (src: string) =>
  `${src.replace(".webp", "-480.webp")} 480w, ${src.replace(".webp", "-800.webp")} 800w, ${src} ${src.includes("savannah") ? 1600 : 1200}w`;
export const heroSizes =
  "(max-width: 640px) calc(100vw - 30px), (max-width: 1050px) 74vw, 57vw";
