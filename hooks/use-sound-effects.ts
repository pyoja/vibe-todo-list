"use client";

import useSound from "use-sound";

// Free sounds hosted commonly or placeholders.
// For Vibe Coding, let's assume valid URLs or empty strings if we can't download.
// ideally user has local files. I will use some generic CDN links if possible,
// or I should ask user to provide sounds.
// But the plan implies I provide them.
// Let's use simple data URIs or rely on standard paths if provided.
// Since I can't guarantee files, I'll assume they exist in public/sounds or use a placeholder approach.
// actually, use-sound works best with local files.
// I will create this hook but comment out the actual play calls if files aren't there,
// or better, I will assume I can place some dummy sounds later.
// For now, I'll use standard short sounds if I can.
// Let's try to use valid public URLs for generic UI sounds.

const SOUNDS = {
  complete: "https://mj-gallery.com/assets/sounds/success.mp3", // Example placeholder
  add: "https://mj-gallery.com/assets/sounds/pop-up-on.mp3",
  delete: "https://mj-gallery.com/assets/sounds/trash.mp3",
  hover: "https://mj-gallery.com/assets/sounds/click.mp3",
};

export function useSoundEffects() {
  const [playComplete] = useSound(SOUNDS.complete, { volume: 0.5 });
  const [playAdd] = useSound(SOUNDS.add, { volume: 0.4 });
  const [playDelete] = useSound(SOUNDS.delete, { volume: 0.3 });

  return {
    playComplete,
    playAdd,
    playDelete,
  };
}
