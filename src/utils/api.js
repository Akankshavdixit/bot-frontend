export const fetchSubjects = async (year, branch) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/subjects?year=${encodeURIComponent(year)}&branch=${encodeURIComponent(branch)}`
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
        `http://localhost:5000/api/resources?year=${encodeURIComponent(year)}&branch=${encodeURIComponent(branch)}&subject=${encodeURIComponent(subject)}&category=${encodeURIComponent(category)}`
      );
      const data = await response.json();
      return data.length > 0 ? data[0].r_url : null;
    } catch (error) {
      console.error("Error fetching resources:", error);
      return null;
    }
  };


export const signIn = async (email, password) => {
  try {
    const response = await fetch(`http://localhost:3001/api/v1/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.data);
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error };
    }
  } catch (error) {
    console.error("Error signing in:", error);
    return { success: false, message: "Something went wrong" };
  }
};
  