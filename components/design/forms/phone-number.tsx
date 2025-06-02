'use client';

import { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from 'libphonenumber-js';
import ReactCountryFlag from 'react-country-flag';

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  register: any; // From react-hook-form
  name: string;
}

const countries: Country[] = getCountries().map((countryCode) => ({
  code: countryCode,
  name: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode,
  dialCode: `+${getCountryCallingCode(countryCode)}`,
}));

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error, register, name }) => {
  const [selectedCountry, setSelectedCountry] = useState('FR'); // Par défaut : France
  const [phoneNumber, setPhoneNumber] = useState(value?.replace(/^\+\d+/, '') || '');

  useEffect(() => {
    if (value) {
      const phone = parsePhoneNumberFromString(value);
      if (phone && phone.country) {
        setSelectedCountry(phone.country);
        setPhoneNumber(phone.nationalNumber);
      }
    }
  }, [value]);

  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
    const dialCode = countries.find((c) => c.code === countryCode)?.dialCode || '';
    onChange(`${dialCode}${phoneNumber}`);
  }, [phoneNumber, onChange]);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newPhone = e.target.value; // Conserver le format saisi
      setPhoneNumber(newPhone);
      const dialCode = countries.find((c) => c.code === selectedCountry)?.dialCode || '';
      onChange(`${dialCode}${newPhone.replace(/\D/g, '')}`); // Nettoyer pour validation
    },
    [selectedCountry, onChange]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="montserrat-regular text-gray-600">
        Numéro de téléphone
      </Label>
      <div className="flex gap-2">
        <Select value={selectedCountry} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-32">
            <SelectValue>
              <div className="flex items-center gap-2">
                <ReactCountryFlag countryCode={selectedCountry} svg />
                {countries.find((c) => c.code === selectedCountry)?.dialCode}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <ReactCountryFlag countryCode={country.code} svg />
                  {country.name} ({country.dialCode})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={name}
          type="tel"
          value={phoneNumber}
          {...register(name)}
          onChange={handlePhoneChange}
          placeholder="1234567890"
          className="flex-1"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default PhoneInput;