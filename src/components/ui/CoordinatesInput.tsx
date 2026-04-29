import { Input } from './input';
import { Label } from './label';

interface CoordinatesInputProps {
  value: [number, number];
  onChange: (coordinates: [number, number]) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  format?: 'single' | 'separate'; // single - одна строка, separate - два поля
}

export const CoordinatesInput = ({
  value,
  onChange,
  label = 'Координаты',
  required = false,
  placeholder = '55.755819, 37.617644',
  className = '',
  format = 'single',
}: CoordinatesInputProps) => {
  if (format === 'separate') {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        <div className="space-y-2">
          <Label htmlFor="longitude">Долгота</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={value[0]}
            onChange={(e) => onChange([Number.parseFloat(e.target.value), value[1]])}
            required={required}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="latitude">Широта</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={value[1]}
            onChange={(e) => onChange([value[0], Number.parseFloat(e.target.value)])}
            required={required}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="coordinates">{label} (формат: широта, долгота)</Label>
      <Input
        id="coordinates"
        type="text"
        defaultValue={`${value[0]}, ${value[1]}`}
        onBlur={(e) => {
          const [latitude, longitude] = e.target.value.split(',').map((item) => Number.parseFloat(item.trim()));

          if (!isNaN(longitude) && !isNaN(latitude)) {
            onChange([latitude, longitude]);
            e.target.value = `${latitude}, ${longitude}`;
          }
        }}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};
