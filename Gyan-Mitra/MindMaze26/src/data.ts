export const clues = [
  { id: 1, filename: "Sys_Compiler.log", riddle: "1. The step-by-step translation of source code into machine code is called ____." }, // Compilation
  { id: 2, filename: "Eq_Solver.md", riddle: "2. If an equation has exactly one solution, the solution is called ____." }, // Unique
  { id: 3, filename: "Frontend_Framework.js", riddle: "3. I am the 'R'—a JavaScript library used for building user interfaces." }, // React
  { id: 4, filename: "CPU_Architecture.txt", riddle: "4. In Computer Architecture, I am a small, extremely fast storage location inside the CPU." }, // Register
  { id: 5, filename: "Elevation_Data.csv", riddle: "5. It is the tallest mountain on Earth (measured from sea level)." }, // Everest
  { id: 6, filename: "Pointer_Exception.log", riddle: "6. In databases, this is a special marker used to indicate that a data value does not exist." }, // Null
  { id: 7, filename: "Global_Entity.txt", riddle: "7. What can you find in every City, every Country, and every Continent, but never in a village?" }, // C
  { id: 8, filename: "Web_Archive_90s.txt", riddle: "8. This early internet giant was once the most popular search engine before Google." }, // Yahoo
  { id: 9, filename: "Kernel_Init.txt", riddle: "9. I am the fundamental software that manages hardware and provides common services." }, // Operating System
  { id: 10, filename: "Table_Constraint.sql", riddle: "10. In DBMS, I am a key used to link two tables together." }, // Foreign Key
  { id: 11, filename: "Astro_Observation.txt", riddle: "11. I am the largest planet in our solar system, famous for my 'Great Red Spot.'" }, // Jupiter
  { id: 12, filename: "Landmass_Record.csv", riddle: "12. This is the largest continent on Earth." }, // Asia
  { id: 13, filename: "Solution_Acidity.log", riddle: "13. This is the unit used to measure the acidity or alkalinity of a solution." }, // pH
  { id: 14, filename: "Quantum_State.txt", riddle: "14. I am the fundamental building block of all matter." }, // Atom
  { id: 15, filename: "Boolean_Gate.cfg", riddle: "15. In a CPU, which basic logic gate outputs 'True' only if both its inputs are 'False'?" } // NOR
];

export type FileNode = { name: string; isFolder: boolean; content?: string; children?: FileNode[] };

const createDecoy = (name: string): FileNode => ({ name, isFolder: false, content: "This is not the clue you're looking for. Keep searching." });

// Updated to use the new filename property instead of numeric IDs
const createClue = (id: number): FileNode => {
  const clue = clues.find(c => c.id === id);
  return { name: clue?.filename || "Unknown_File.txt", isFolder: false, content: clue?.riddle };
};

export const fileSystem: FileNode = {
  name: "???",
  isFolder: true,
  children: [
    { name: "System", isFolder: true, children: [
        { name: "Logs", isFolder: true, children: [createDecoy("error_log_14.txt"), createClue(3)] },
        { name: "Config", isFolder: true, children: [createDecoy("settings.txt"), createClue(7)] },
        { name: "Drivers", isFolder: true, children: [createClue(10)] }
    ]},
    { name: "Users", isFolder: true, children: [
        { name: "Admin", isFolder: true, children: [
            { name: "Documents", isFolder: true, children: [createClue(1), createDecoy("notes_backup.txt")] },
            { name: "Downloads", isFolder: true, children: [createClue(5), createDecoy("readme.txt")] }
        ]},
        { name: "Guest", isFolder: true, children: [createClue(8), createDecoy("temp.txt")] }
    ]},
    { name: "Programs", isFolder: true, children: [
        { name: "Utilities", isFolder: true, children: [createClue(12)] },
        { name: "Games", isFolder: true, children: [createClue(6), createDecoy("scores.txt")] }
    ]},
    { name: "Archive", isFolder: true, children: [
        { name: "1995_Backup", isFolder: true, children: [createClue(2), createDecoy("old_data.txt")] },
        { name: "2000_Backup", isFolder: true, children: [createClue(9)] },
        { name: "Misc", isFolder: true, children: [createClue(11), createClue(4)] }
    ]},
    { name: "Network", isFolder: true, children: [
        { name: "Shared", isFolder: true, children: [createClue(13)] },
        { name: "Private", isFolder: true, children: [createClue(15)] }
    ]},
    { name: "Temp", isFolder: true, children: [createClue(14), createDecoy("~temp001.txt"), createDecoy("cache.txt")] }
  ]
};