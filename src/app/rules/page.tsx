import { Footer } from "@/components/notices";

export default function RulesPage() {
  return (
    <article className="panel" style={{ maxWidth: 720 }}>
      <p className="kicker">Reglas</p>
      <h1 className="display" style={{ fontSize: 52 }}>Confianza primero</h1>
      <p>Tokkame es una plataforma para adultos. Estas reglas no son un anexo: son parte del producto.</p>
      <ul>
        <li>Hay que tener 18 años o más para entrar, crear un perfil o pagar.</li>
        <li>No se permiten cuentas, archivos ni textos que involucren a menores. Eso se bloquea y se reporta.</li>
        <li>El creador confirma que las personas de su contenido son adultas y consintieron.</li>
        <li>La monetización se enciende después de la verificación de identidad y edad.</li>
        <li>Cualquier persona puede reportar una publicación o un perfil. Administración puede retirar contenido y suspender cuentas.</li>
        <li>La región es opcional. Tokkame no pide GPS.</li>
        <li>Los pagos de esta versión son saldo de prueba. El cobro real usará un procesador que acepte este modelo.</li>
      </ul>
      <Footer />
    </article>
  );
}
