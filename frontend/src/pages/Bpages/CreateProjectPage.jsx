import ProjectAddForm from "../../components/Bcomponents/ProjectAddForm";

export default function CreateProjectPage() {
  function handleSuccess(project) {
    alert(`Project "${project.title}" created successfully!`);
    // Optionally redirect to project list or detail page
  }

  return (
    <div className="page-container">
      <ProjectAddForm onSuccess={handleSuccess} />
    </div>
  );
}
