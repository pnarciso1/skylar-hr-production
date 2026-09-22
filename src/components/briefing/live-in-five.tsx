"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  MessageCircleQuestion,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { createEmployeeAction, createNoteAction } from "@/features/briefing/create-actions";
import { PEOPLE_PATH } from "@/constants/routes";
import type { AuthSession } from "@/types/auth";

const totalSteps = 6;

type LiveInFiveProps = {
  session: AuthSession;
};

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function LiveInFive({ session }: LiveInFiveProps) {
  const [step, setStep] = useState<Step>(1);
  const [workspaceName, setWorkspaceName] = useState(session.companyId);
  const [workEmail, setWorkEmail] = useState(session.email ?? "");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [situation, setSituation] = useState("");
  const [whatChanged, setWhatChanged] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const progress = `${step}/${totalSteps}`;
  const plan = useMemo(
    () => ({
      title: `A calm next step with ${employeeName || "your employee"}.`,
      body:
        "Start with curiosity, listen for what changed, and leave the conversation with one clear expectation that both of you can follow.",
      note: [
        situation && `What happened: ${situation}`,
        whatChanged && `What changed: ${whatChanged}`,
        nextStep && `Agreed next step: ${nextStep}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    }),
    [employeeName, nextStep, situation, whatChanged],
  );

  function advance() {
    setError("");
    if (step === 1 && (!workspaceName.trim() || !workEmail.trim())) {
      setError("Add your workspace name and work email to continue.");
      return;
    }
    if (step === 2) {
      if (!employeeName.trim() || !employeeEmail.trim()) {
        setError("Add the employee name and work email to continue.");
        return;
      }
      startTransition(async () => {
        try {
          const result = await createEmployeeAction({
            name: employeeName,
            email: employeeEmail,
            jobTitle,
            location,
            summary: "",
          }, { revalidateBriefing: false });
          if (!result.ok) {
            setError(result.message);
            return;
          }
          setEmployeeId(result.id ?? "");
          setStep(3);
        } catch {
          setError("Skylar could not reach the workspace. Check the connection and try again.");
        }
      });
      return;
    }
    if (step === 3 && situation.trim().length < 8) {
      setError("Give Skylar a little context so the next step is useful.");
      return;
    }
    if (step === 4 && (!whatChanged.trim() || !nextStep.trim())) {
      setError("Answer both questions before moving to the plan.");
      return;
    }
    if (step < totalSteps) setStep((current) => (current + 1) as Step);
  }

  function savePlan() {
    if (!employeeId) {
      setError("The employee file is not ready yet. Go back and try again.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createNoteAction({
          employeeId,
          note: plan.note || plan.body,
          statusDot: "amber",
        }, { revalidateBriefing: false });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setError("");
        setStep(6);
      } catch {
        setError("Skylar could not save the plan. Check the connection and try again.");
      }
    });
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-sun">Live in 5</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] md:text-5xl">
            Start with the people work that matters today.
          </h1>
        </div>
        <p className="font-mono text-sm text-paper-3">{progress}</p>
      </header>

      <div className="h-1 overflow-hidden rounded-full bg-paper/[0.08]" aria-label={`Step ${progress}`}>
        <div
          className="h-full bg-sun transition-[width] duration-300 ease-out"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <article className="overflow-hidden rounded-[20px] bg-ink-2 text-paper shadow-[0_24px_70px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(244,239,231,0.055),inset_0_1px_0_rgba(244,239,231,0.08)]">
        <div className="flex items-center justify-between border-b border-paper/10 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <StepIcon step={step} />
            <p className="font-mono text-xs uppercase text-paper-3">{stepLabel(step)}</p>
          </div>
          <p className="font-mono text-xs text-paper-3">{progress}</p>
        </div>

        <div className="grid gap-8 px-5 py-7 md:px-10 md:py-10">
          {step === 1 && (
            <StepFrame
              eyebrow="Who are you?"
              title="Let’s get the room ready for your workday."
              body="Tell Skylar which workspace you are working in. We’ll keep the first conversation focused and private."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Workspace name" value={workspaceName} onChange={setWorkspaceName} placeholder="Your company" />
                <TextField label="Work email" value={workEmail} onChange={setWorkEmail} placeholder="you@company.com" type="email" />
              </div>
            </StepFrame>
          )}

          {step === 2 && (
            <StepFrame
              eyebrow="Who is this about?"
              title="Name the person you want to keep in view."
              body="This creates a real employee file. You can add more context now or refine it later."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Employee name" value={employeeName} onChange={setEmployeeName} placeholder="Maya Chen" />
                <TextField label="Work email" value={employeeEmail} onChange={setEmployeeEmail} placeholder="maya@company.com" type="email" />
                <SelectField label="Role" value={jobTitle} onChange={setJobTitle} />
                <TextField label="Location" value={location} onChange={setLocation} placeholder="Remote, Lahore..." />
              </div>
            </StepFrame>
          )}

          {step === 3 && (
            <StepFrame
              eyebrow="What’s going on?"
              title="Put the situation into your own words."
              body="A little honest context helps Skylar keep the next conversation specific and fair."
            >
              <TextareaField label="Situation" value={situation} onChange={setSituation} placeholder="What happened, and why does it need attention now?" />
              <div className="grid gap-3 md:grid-cols-3">
                {["An attendance pattern changed", "A difficult conversation is due", "A next step needs recording"].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setSituation(prompt)}
                    className="border border-paper/10 px-4 py-3 text-left text-sm text-paper-2 transition-colors hover:border-paper/25 hover:bg-paper/[0.05]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </StepFrame>
          )}

          {step === 4 && (
            <StepFrame
              eyebrow="A little more context"
              title="What would make this conversation useful?"
              body="Two short answers are enough. Skylar will use them to shape a grounded plan."
            >
              <div className="grid gap-5">
                <TextareaField label="What changed?" value={whatChanged} onChange={setWhatChanged} placeholder="What is different since the last conversation?" />
                <TextareaField label="What should happen next?" value={nextStep} onChange={setNextStep} placeholder="What would a fair, practical next step look like?" />
              </div>
            </StepFrame>
          )}

          {step === 5 && (
            <StepFrame
              eyebrow="The plan"
              title={plan.title}
              body={plan.body}
            >
              <div className="grid gap-3 border-y border-paper/10 py-5">
                {["Open with curiosity", "Listen for context", "Agree one clear next step"].map((item, index) => (
                  <div key={item} className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-full border border-paper/15 font-mono text-xs text-paper">{index + 1}</span>
                    <p className="font-semibold text-paper">{item}</p>
                  </div>
                ))}
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-paper-2">{plan.note}</p>
            </StepFrame>
          )}

          {step === 6 && (
            <StepFrame
              eyebrow="Filed for tomorrow"
              title="The first piece of context is safely in the record."
              body={`${employeeName || "The employee"} now has a saved note. You can open the file or return to the daily Briefing when you are ready.`
              }
            >
              <div className="grid gap-4 border-y border-paper/10 py-5 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 text-success" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-paper">Saved to the employee ledger</p>
                    <p className="mt-1 text-sm leading-6 text-paper-2">The next follow-up can now return with context attached.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-5 text-attention" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-paper">Ready for the next briefing</p>
                    <p className="mt-1 text-sm leading-6 text-paper-2">Skylar will keep this record close to the person it belongs to.</p>
                  </div>
                </div>
              </div>
            </StepFrame>
          )}

          {error && <p role="alert" className="border-l-2 border-risk px-3 py-2 text-sm font-semibold text-risk">{error}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {step > 1 && step < 6 ? (
              <button type="button" onClick={() => setStep((current) => (current - 1) as Step)} className="inline-flex h-12 items-center gap-2 px-1 font-mono text-xs uppercase text-paper-3 transition-colors hover:text-paper">
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </button>
            ) : <span />}
            {step < 5 && (
              <button type="button" onClick={advance} disabled={isPending} className="inline-flex h-12 items-center gap-3 bg-paper px-5 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50">
                {isPending ? "Saving..." : "Continue"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
            {step === 5 && (
              <button type="button" onClick={savePlan} disabled={isPending} className="inline-flex h-12 items-center gap-3 bg-paper px-5 font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50">
                {isPending ? "Saving..." : "Save to employee record"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            )}
            {step === 6 && (
              <div className="flex flex-wrap gap-3">
                {employeeId && <Link href={`/people/${employeeId}`} className="inline-flex h-12 items-center gap-2 border border-paper/15 px-5 font-semibold text-paper transition-colors hover:bg-paper/[0.05]">Open employee file</Link>}
                <Link href={PEOPLE_PATH} className="inline-flex h-12 items-center gap-2 bg-paper px-5 font-semibold text-ink transition-opacity hover:opacity-90">Return to People</Link>
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}

function stepLabel(step: Step) {
  return ["Your workspace", "The person", "The situation", "The context", "The plan", "Filed"] [step - 1];
}

function StepIcon({ step }: { step: Step }) {
  const Icon = step === 2 ? UserRound : step === 4 ? MessageCircleQuestion : step === 5 || step === 6 ? FileText : Check;
  return <Icon className="size-4 text-sun" aria-hidden="true" />;
}

function StepFrame({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-7">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase text-paper-3">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-paper md:text-5xl">{title}</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-paper-2 md:text-lg">{body}</p>
      </div>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-paper-2">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-12 border-0 border-b-2 border-paper/15 bg-transparent px-0 text-lg text-paper outline-none placeholder:text-paper-3 focus:border-paper" />
    </label>
  );
}

function SelectField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-paper-2">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 border-0 border-b-2 border-paper/15 bg-transparent px-0 text-lg text-paper outline-none focus:border-paper">
        <option value="" className="bg-ink-2">Choose a role</option>
        <option>Customer Success Lead</option>
        <option>Operations Manager</option>
        <option>Product Designer</option>
        <option>Sales Manager</option>
        <option>People Operations</option>
        <option>Other</option>
      </select>
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-paper-2">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="resize-y border-0 border-b-2 border-paper/15 bg-transparent px-0 py-2 text-lg leading-7 text-paper outline-none placeholder:text-paper-3 focus:border-paper" />
    </label>
  );
}
