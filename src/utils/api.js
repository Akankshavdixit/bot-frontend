export const fetchSubjects = async (year, branch) => {
    try {
      const response = await fetch(
        `https://bot-f0c6.onrender.com/api/subjects?year=${encodeURIComponent(year)}&branch=${encodeURIComponent(branch)}`
      );
      const data = await response.json();
      return data.map((subject) => subject.s_name);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  };
  
  export const fetchResources = async ({ year, branch, subject, category }) => {
    try {
      const response = await fetch(
        `https://bot-f0c6.onrender.com/api/resources?year=${encodeURIComponent(year)}&branch=${encodeURIComponent(branch)}&subject=${encodeURIComponent(subject)}&category=${encodeURIComponent(category)}`
      );
      const data = await response.json();
      return data.length > 0 ? data[0].r_url : null;
    } catch (error) {
      console.error("Error fetching resources:", error);
      return null;
    }
  };
  