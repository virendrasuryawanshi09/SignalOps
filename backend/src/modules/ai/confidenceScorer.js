
class ConfidenceScorer {

  calculateRefinedScore(incident, analysisResult) {
    const baseScore = Number(analysisResult.confidenceScore) || 50;
    let scoreModifiers = 0;

   
    if (analysisResult.evidence && Array.isArray(analysisResult.evidence)) {
      const matchCount = analysisResult.evidence.filter(ev => {
        const cleanEv = ev.toLowerCase();
        return incident.title.toLowerCase().includes(cleanEv) || 
               (incident.rootCauseAnalysis && incident.rootCauseAnalysis.toLowerCase().includes(cleanEv));
      }).length;
      
      if (matchCount > 0) {
        scoreModifiers += Math.min(25, matchCount * 10);
      }
    }

   
    if (incident.occurrences > 100) {
      scoreModifiers += 15;
    } else if (incident.occurrences > 10) {
      scoreModifiers += 10;
    }

   
    if (incident.status === "INVESTIGATING") {
      scoreModifiers += 5;
    }

   
    if (["HIGH", "CRITICAL"].includes(incident.severity)) {
      scoreModifiers += 10;
    }


    return Math.min(100, Math.max(0, baseScore + scoreModifiers));
  }
}

module.exports = new ConfidenceScorer();
