"use client";

import { useState } from "react";
import FraudResultsModal from "./FraudResultsModal";

export default function ModalTest() {
  const [isOpen, setIsOpen] = useState(false);

  const testProvider = {
    first_name: "Robert",
    last_name: "Miller",
    npi_number: "1357924680",
    risk_score: 65,
    risk_level: "High",
    flags: [
      {
        rule_name: "Duplicate Participant",
        description: "Phone number matches another participant.",
        score_weight: 25,
      },
      {
        rule_name: "NPI Name Mismatch",
        description: "Submitted name does not match the NPI record.",
        score_weight: 20,
      },
      {
        rule_name: "Specialty Mismatch",
        description: "Submitted specialty does not match the NPI taxonomy.",
        score_weight: 20,
      },
    ],
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-blue-500/80 px-4 py-4 mt-10 text-sm font-medium text-white hover:bg-blue-500"
      >
        Test Fraud Results
      </button>

      {isOpen && (
        <FraudResultsModal
          provider={testProvider}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
