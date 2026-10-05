import sql from "./db";

export async function getDashboardParticipants() {
    const participants = await sql`
        SELECT
            p.panelist_id,
            p.first_name,
            p.last_name,
            p.email,
            p.npi_number,
            p.specialty,
            p.risk_score,
            p.risk_level,
            p.review_status,
            COALESCE(
                json_agg(
                    json_build_object(
                        'ruleCode', fr.rule_code,
                        'ruleName', fr.rule_name,
                        'weight', fr.risk_score_weight,
                        'explanation', pf.explanation
                        )
                        ) FILTER (WHERE fr.rule_id IS NOT NULL),
                         '[]'
                ) AS fraud_checks
            FROM panelists p
            LEFT JOIN panelist_flags pf
                ON p.panelist_id = pf.panelist_id
            LEFT JOIN fraud_rules fr
                ON pf.rule_id = fr.rule_id
            GROUP BY
                p.panelist_id
            ORDER BY
                p.panelist_id DESC
            `;
            return participants;
}