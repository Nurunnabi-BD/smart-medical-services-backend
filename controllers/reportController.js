import Report from "../models/Report.js";

// Upload Report (Patient Action)
export const uploadReport = async (req, res) => {
  try {
    const { title, fileUrl } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ message: "Please provide title and fileUrl" });
    }

    const report = await Report.create({
      patient: req.user._id,
      title,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      fileUrl,
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get My Reports (Patient or Admin, or Doctor reviewing history)
export const getMyReports = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "patient") {
      query.patient = req.user._id;
    } else if (req.query.patientId) {
      // Doctor or Admin looking up a specific patient's reports
      query.patient = req.query.patientId;
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these reports" });
    }

    const reports = await Report.find(query).populate("patient", "name email");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Report
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only patient who uploaded it or admin can delete
    if (report.patient.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this report" });
    }

    await report.deleteOne();
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
