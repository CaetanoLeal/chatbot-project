import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const apiUrl = process.env.API_INTERNAL_URL!;

    const response = await fetch(`${apiUrl}/api/usuarios/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      redirect("/login");
    }

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Resposta:", data);

    // Se a API retornar is_lembrar = false, redireciona para o login
    if (data.usuario?.is_lembrar === false) {
      redirect("/login");
    }

    redirect("/dashboard");
  } catch (error) {
    console.error("Erro ao validar sessão:", error);
    redirect("/login");
  }
}