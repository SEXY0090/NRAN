export default function Home() {
  return <main className="home"><section><p className="eyebrow">EMPLOYEE SERVICES</p><h1>Employee E-Verification</h1><p>Enter the verification number printed on the employee document.</p><form action="/verify/"><input aria-label="Verification number" name="serial" placeholder="MRZ-83854-290" required/><button type="submit">Verify record</button></form><p className="hint">Example format: MRZ-83854-290</p></section></main>;
}
