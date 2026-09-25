export async function verifyNpi(providerData): Promise<{
  npiValid: boolean;
  nameMatch: boolean;
  specialtyMatch: boolean;
}> {
  const npiData = await fetchNpi(providerData.npi);

  if (npiData.result_count === 0) {
    return {
      npiValid: false,
      nameMatch: false,
      specialtyMatch: false,
    };
  }

  const nameMatch = verifyName(providerData, npiData.results[0]);

  const specialtyMatch = verifySpecialty(
    providerData.specialty,
    npiData.results[0],
  );

  return {
    npiValid: true,
    nameMatch,
    specialtyMatch,
  };
}

export async function fetchNpi(npi: string) {
  const response = await fetch(
    `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`,
  );

  if (!response.ok) {
    throw new Error(`NPI API request failed: ${response.status}`);
  }

  const data = await response.json();

  return data;
}

function verifyName(provider, npiData) {

  const providerFirstName = provider.first_name.trim().toLowerCase();
  const providerLastName = provider.last_name.trim().toLowerCase();

  const npiFirstName = npiData.basic.first_name.trim().toLowerCase();
  const npiLastName = npiData.basic.last_name.trim().toLowerCase();

  if (providerLastName != npiLastName || providerFirstName != npiFirstName) {
    return false;
  }
  
  return true;
}

function verifySpecialty(providerSpecialty, npiData) {

  providerSpecialty = normalizeSpecialty(providerSpecialty);
  const npiSpecialties = npiData.taxonomies.map((each) => {
    return normalizeSpecialty(each.desc);
  })
  
  for (const specialty of npiSpecialties) {
    
    if (providerSpecialty === specialty) {
      return true;
    }
  }

  return false;
    
}

function normalizeSpecialty(specialty: string) {
  return specialty
    .toLowerCase()
    .replace(/[-,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}