# Build a Form Builder with Validation

## Requirements
- Define form schema (fields, types, validations)
- Render form dynamically from schema
- Client-side validation with error messages
- Support: text, email, number, select, checkbox, textarea

## Schema-Driven Approach
```javascript
const formSchema = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, minLength: 2 },
  { name: 'email', label: 'Email', type: 'email', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { name: 'age', label: 'Age', type: 'number', required: true, min: 18, max: 99 },
  { name: 'role', label: 'Role', type: 'select', options: ['Developer', 'Designer', 'PM'], required: true },
];
```

## Core Implementation
```javascript
function DynamicForm({ schema, onSubmit }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    schema.forEach(field => {
      const val = values[field.name] || '';
      if (field.required && !val) newErrors[field.name] = `${field.label} is required`;
      else if (field.minLength && val.length < field.minLength)
        newErrors[field.name] = `Min ${field.minLength} characters`;
      else if (field.pattern && !field.pattern.test(val))
        newErrors[field.name] = `Invalid ${field.label.toLowerCase()}`;
      else if (field.min && Number(val) < field.min)
        newErrors[field.name] = `Min value is ${field.min}`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSubmit(values); };

  return (
    <form onSubmit={handleSubmit}>
      {schema.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select value={values[field.name] || ''} onChange={e => setValues({...values, [field.name]: e.target.value})}>
              <option value="">Select...</option>
              {field.options.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input type={field.type} value={values[field.name] || ''}
              onChange={e => setValues({...values, [field.name]: e.target.value})} />
          )}
          {errors[field.name] && <span className="error">{errors[field.name]}</span>}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Key Patterns
- **Schema-driven**: form shape defined by JSON, not hardcoded JSX
- **Validation**: run on submit + optionally on blur (field-level)
- **Error state**: object mapping field names to error messages
- **Extensible**: add new field types by extending the renderer

## Interview Tips
- Schema approach shows good design thinking
- Mention libraries like Formik, React Hook Form, Zod/Yup for production
- Discuss controlled vs uncontrolled, accessibility (labels, aria-invalid)
