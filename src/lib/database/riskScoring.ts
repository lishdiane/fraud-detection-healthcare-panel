import { Pool, PoolClient } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

type Database = Pool | PoolClient;

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskScoreResult = {
    score: number;
    level: RiskLevel;
    rules: {
        ruleId: number;
        ruleCode: string;
        weight: number;
    }[];
};

export async function calculateRiskScore(
    ruleCodes: string[],
    database: Database = pool
): Promise<RiskScoreResult> {
    const uniqueRuleCodes = Array.from(new Set(ruleCodes));

    if (uniqueRuleCodes.length === 0) {
        return {
            score: 0,
            level: "low",
            rules: [],
        };
    }

    const result = await database.query(
        `
        SELECT
            rule_id,
            rule_code,
            risk_score_weight
        FROM fraud_rules
        WHERE rule_code = ANY($1)
        AND is_active = TRUE
        `,
        [uniqueRuleCodes]
    );

    let score = 0;

    const rules = result.rows.map((rule) => {
        const weight = Number(rule.risk_score_weight);

        score += weight;

        return {
                ruleId: rule.rule_id,
                ruleCode: rule.rule_code,
                weight,
        };
    });

    score = Math.min(score, 100);

    let level: RiskLevel = "low";

    if (score >= 75) {
        level = "critical";
    } else if (score >= 50) {
        level = "high";
    } else if (score >= 25) {
        level = "medium";
    }

    return {
        score, level, rules
    };
    
} 