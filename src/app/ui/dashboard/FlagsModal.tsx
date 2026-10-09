"use client";

import { useState } from "react";
import { fetchFlagsByPanelistId } from "../../lib/actions";
import FraudResultsModal from "../FraudResultsModal";

interface Panelist {
  panelist_id: number;
  first_name: string;
  last_name: string;
  npi_number: string;
  email: string;
  specialty: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  risk_score: number;
  risk_level: string;
}

interface FlagsModalProps {
  panelist: Panelist;
}

export default function FlagsModal({ panelist }: FlagsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await fetchFlagsByPanelistId(panelist.panelist_id);
      setFlags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

return (
  <>
    <button
      onClick={handleOpen}
      className="text-blue-600 hover:underline font-medium text-xs md:text-sm"
    >
      See flags
    </button>

    {isOpen && !loading && (
      <FraudResultsModal
        provider={{
          first_name: panelist.first_name,
          last_name: panelist.last_name,
          npi_number: panelist.npi_number,
          email: panelist.email,
          specialty: panelist.specialty,
          street_address: panelist.street_address,
          city: panelist.city,
          state: panelist.state,
          postal_code: panelist.postal_code,
          risk_score: panelist.risk_score,
          risk_level: panelist.risk_level,
          flags: flags,
        }}
        onClose={() => setIsOpen(false)}
      />
    )}
  </>
);
}