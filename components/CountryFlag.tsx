import Image from 'next/image';
export function CountryFlag({country}:{country:string}){return <Image className="country-flag" src={'/flags/'+country.toUpperCase()+'.svg'} alt="" aria-hidden="true" width={24} height={16} unoptimized/>}
