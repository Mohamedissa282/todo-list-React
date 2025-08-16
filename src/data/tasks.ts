export type Task = {
  id: number;
  text: string;
  status: string;
};

export const tasks: Task[] = [
  { id: 1, text: "Ouvrir un compte bancaire", status: "En cours" },
  { id: 2, text: "Trouver un logement", status: "Non commencé" },
  { id: 3, text: "Acheter une carte SIM", status: "Terminé" }
];
