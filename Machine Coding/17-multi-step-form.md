# Build a Multi-step Wizard Form

## Requirements
- Step indicator (Step 1 of 3), prev/next navigation
- Validate each step before proceeding
- Persist data across steps
- Review step before final submission

## Implementation
```javascript
function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const update = (data) => setFormData(prev => ({ ...prev, ...data }));

  const steps = [
    { title: 'Personal', component: <PersonalInfo data={formData} onUpdate={update} /> },
    { title: 'Address', component: <AddressInfo data={formData} onUpdate={update} /> },
    { title: 'Review', component: <ReviewStep data={formData} /> },
  ];

  const validateStep = () => {
    if (step === 0) return formData.name && formData.email;
    if (step === 1) return formData.city && formData.zip;
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, steps.length - 1)); };
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const submit = () => { console.log('Submit:', formData); };

  return (
    <div>
      <div className="stepper">
        {steps.map((s, i) => (
          <span key={i} className={i === step ? 'active' : i < step ? 'done' : ''}>{s.title}</span>
        ))}
      </div>
      {steps[step].component}
      <div className="buttons">
        {step > 0 && <button onClick={prev}>Back</button>}
        {step < steps.length - 1 ? <button onClick={next}>Next</button> : <button onClick={submit}>Submit</button>}
      </div>
    </div>
  );
}
```

## Key Patterns
- **Shared state** lifted to parent, passed down to step components
- **Step validation** before allowing next
- **Stepper indicator** with active/done/pending states
- **Review step** displays all collected data for confirmation
