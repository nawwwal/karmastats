// SES Classification data (Updated 2024)
// Multiple classification systems for socioeconomic status assessment

export const sesClassifications = {
  prasad: {
    name: "Modified Prasad Classification 2024",
    classes: [
      { min: 10533, class: "Class I (Upper)", color: "success" },
      { min: 5267, max: 10532, class: "Class II (Upper Middle)", color: "info" },
      { min: 3160, max: 5266, class: "Class III (Middle)", color: "warning" },
      { min: 1580, max: 3159, class: "Class IV (Lower Middle)", color: "warning" },
      { min: 0, max: 1579, class: "Class V (Lower)", color: "danger" }
    ]
  },
  kuppuswami: {
    name: "Modified Kuppuswami Scale",
    classes: [
      { min: 52734, class: "Upper (I)", color: "success" },
      { min: 26355, max: 52733, class: "Upper Middle (II)", color: "info" },
      { min: 19759, max: 26354, class: "Lower Middle (III)", color: "warning" },
      { min: 13161, max: 19758, class: "Upper Lower (IV)", color: "warning" },
      { min: 0, max: 13160, class: "Lower (V)", color: "danger" }
    ]
  },
  pareek: {
    name: "Pareek's Classification (Rural)",
    classes: [
      { min: 30000, class: "Upper High", color: "success" },
      { min: 20000, max: 29999, class: "High", color: "info" },
      { min: 15000, max: 19999, class: "Upper Middle", color: "info" },
      { min: 10000, max: 14999, class: "Middle", color: "warning" },
      { min: 5000, max: 9999, class: "Lower Middle", color: "warning" },
      { min: 2500, max: 4999, class: "Poor", color: "danger" },
      { min: 0, max: 2499, class: "Very Poor", color: "danger" }
    ]
  }
} as const;
