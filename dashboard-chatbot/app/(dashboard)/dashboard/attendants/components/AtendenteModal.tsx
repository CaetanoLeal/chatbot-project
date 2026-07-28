import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Bot, User } from "lucide-react";

type Setor = {
  id_setor: string;
  no_setor: string;
};

type Atendente = {
  id_atendente?: string;
  no_atendente: string;
  setores: Setor[];
  is_ia: boolean;
  im_image?: string |null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  atendenteToEdit?: Atendente | null;
};

export default function AtendenteModal({
  isOpen,
  onClose,
  onSuccess,
  atendenteToEdit,
}: Props) {
  const [nome, setNome] = useState("");
  const [idSetor, setIdSetor] = useState<string[]>([]);
  const [isIa, setIsIa] = useState(false);
  const [imagemBase64, setImagemBase64] = useState("");
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/setores`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar os setores");
        }

        const data = await response.json();
        setSetores(data);
      } catch (err) {
        console.error("Falha ao carregar setores:", err);
      }
    };

    fetchSetores();
  }, []);

  useEffect(() => {
    if (atendenteToEdit) {
      setNome(atendenteToEdit.no_atendente);
      setIdSetor(
        atendenteToEdit.setores.map((s) => s.id_setor)
      );
      setIsIa(atendenteToEdit.is_ia);
      setImagemBase64(atendenteToEdit.im_image || "");
    } else {
      setNome("");
      setIdSetor([]);
      setIsIa(false);
      setImagemBase64("");
    }

    setError("");
  }, [atendenteToEdit, isOpen]);

  const handleToggleSetor = (id: string) => {
    setIdSetor((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagemBase64(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (idSetor.length === 0) {
      setError("Selecione pelo menos um setor.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      no_atendente: nome,
      id_setor: idSetor,
      is_ia: isIa,
      im_image: imagemBase64,
    };

    const url = atendenteToEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/atendentes/${atendenteToEdit.id_atendente}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/atendentes`;

    const method = atendenteToEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao salvar atendente.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-zinc-800 mb-4">
          {atendenteToEdit ? "Editar Atendente" : "Novo Atendente"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-zinc-700">
          <div>
            <label className="block text-sm font-medium mb-1">
              Foto de Perfil
            </label>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center border border-zinc-300">
                {imagemBase64 ? (
                  <img
                    src={imagemBase64}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : isIa ? (
                  <Bot className="w-8 h-8 text-zinc-400" />
                ) : (
                  <User className="w-8 h-8 text-zinc-400" />
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Nome
            </label>

            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border rounded border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Setores
            </label>

            <div className="max-h-56 overflow-y-auto rounded border border-zinc-300 divide-y">
              {setores.map((setor) => (
                <label
                  key={setor.id_setor}
                  className="flex items-center justify-between px-3 py-2 hover:bg-zinc-50 cursor-pointer"
                >
                  <span className="text-sm">{setor.no_setor}</span>

                  <input
                    type="checkbox"
                    checked={idSetor.includes(setor.id_setor)}
                    onChange={() => handleToggleSetor(setor.id_setor)}
                    className="w-4 h-4 text-blue-600 rounded border-zinc-300"
                  />
                </label>
              ))}
            </div>

            <p className="text-xs text-zinc-500 mt-2">
              Selecione um ou mais setores para este atendente.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isIa"
              checked={isIa}
              onChange={(e) => setIsIa(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-zinc-300"
            />

            <label
              htmlFor="isIa"
              className="text-sm font-medium cursor-pointer flex items-center gap-1"
            >
              Atendente é uma Inteligência Artificial
              <Bot className="w-4 h-4 text-blue-600 ml-1" />
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}