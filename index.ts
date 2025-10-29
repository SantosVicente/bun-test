import { Elysia } from "elysia";
import { desc } from "drizzle-orm";
import { db, products } from "./src/db";

const app = new Elysia()
  .get("/", async () => {
    const list = await db.select().from(products).orderBy(desc(products.id));
    const rows = list
      .map(
        (p) => `
                <tr>
                  <td>${p.id}</td>
                  <td>${p.name}</td>
                  <td>R$ ${Number(p.price).toFixed(2)}</td>
                  <td>${new Date(p.createdAt).toLocaleString("pt-BR")}</td>
                </tr>`
      )
      .join("");
    const page = `
      <!DOCTYPE html>
      <html lang="pt-br">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Produtos</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
            form { display: flex; gap: .5rem; margin-bottom: 1rem; }
            input, button { padding: .6rem .8rem; font-size: 1rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: .6rem; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f7f7f7; }
          </style>
        </head>
        <body>
          <h1>Cadastro de Produtos</h1>
          <form method="post" action="/products">
            <input required name="name" placeholder="Nome do produto" />
            <input
              required
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Preço"
            />
            <button type="submit">Salvar</button>
          </form>

          <h2>Lista</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;
    return new Response(page, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  })
  .post("/products", async ({ request, set }) => {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const price = Number(form.get("price"));

    if (!name || !Number.isFinite(price) || price < 0) {
      set.status = 400;
      return "Dados inválidos";
    }

    await db.insert(products).values({ name, price }).run();
    set.status = 303;
    set.headers = { Location: "/" };
    return "Created";
  });

app.listen(3002);
console.log(`Listening on http://localhost:3002`);
