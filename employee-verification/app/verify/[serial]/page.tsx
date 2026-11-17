import { getEmployee } from "@/lib/github";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function VerifyPage({ params }: { params: Promise<{serial:string}> }) {
  const { serial } = await params;
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(serial) || serial === "." || serial === "..") notFound();
  let employee;
  try { employee = await getEmployee(serial); } catch { employee = null; }
  if (!employee) notFound();

  return (
    <main className="document-mrz">
      <header className="mrz-header">
        <img className="fingerprint-icon" src="https://raw.githubusercontent.com/SEXY0090/NRAN/refs/heads/main/fingerprint.png" alt="Fingerprint illustration" />
        <div className="header-text">
          <h1>Authenticate your document</h1>
          <p>Thank you for submitting your document for verification.<br/>Please find below the answer to your request.</p>
        </div>
      </header>
      <section className="mrz-background">
        <article className="mrz-card">
        
          <div className="mrz-status">
            <img className="success-icon" src="https://raw.githubusercontent.com/SEXY0090/NRAN/refs/heads/main/circle_success.png" alt="Record found" />
          </div>
         <div className="mrz-content">
  {employee.fields.map((field, index) => (
    <div className="mrz-row" key={`${field.label}-${index}`}>
      <strong>{field.label} :</strong><span>{field.value}</span>
    </div>
  ))}
</div>
          <footer className="mrz-footer">
            <p>For any further information on this document, please contact the issuer of the document.</p>
          </footer>
        </article>
      </section>
    </main>
  );
}
