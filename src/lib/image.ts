// Redimensionne une image côté navigateur avant envoi, pour éviter de stocker
// des fichiers trop lourds (les photos sont enregistrées en base64 dans la base).
export function redimensionnerImage(fichier: File, tailleMax = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = (evenement) => {
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(tailleMax / image.width, tailleMax / image.height, 1);
        const largeur = image.width * ratio;
        const hauteur = image.height * ratio;

        const canvas = document.createElement("canvas");
        canvas.width = largeur;
        canvas.height = hauteur;
        const contexte = canvas.getContext("2d");
        contexte?.drawImage(image, 0, 0, largeur, hauteur);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.onerror = reject;
      image.src = evenement.target?.result as string;
    };
    lecteur.onerror = reject;
    lecteur.readAsDataURL(fichier);
  });
}