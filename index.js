const fs = require("fs");

function analyzeFile(filePath) {
  // Read the content of the CSV file
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Parse CSV content
  const rows = fileContent.trim().split("\n");
  const header = rows.shift().split(","); // Assuming comma-separated values

  // Indices of required columns
  const nameIndex = header.indexOf("Employee Name");
  const positionIndex = header.indexOf("Position ID");
  const timeIndex = header.indexOf("Time");
  const timeOutIndex = header.indexOf("Time Out");
  const hoursWorkedIndex = header.indexOf("Timecard Hours (as Time)");

  // Data structures to store employee information
  const employees = {};

  // Function to calculate the time difference in hours
  function calculateTimeDifference(start, end) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const timeDifference = (endTime - startTime) / (1000 * 60 * 60);
    return timeDifference;
  }

  // Function to check if an array has consecutive days
  function hasConsecutiveDays(dateArray, consecutiveDays) {
    for (let i = 1; i < dateArray.length; i++) {
      const timeDifference = calculateTimeDifference(dateArray[i - 1], dateArray[i]);
      if (timeDifference !== 24 && !(i === dateArray.length - 1 && timeDifference === 0)) {
        return false;
      }
    }
    return dateArray.length >= consecutiveDays;
  }

  // Iterate through each row
  rows.forEach((row) => {
    const columns = row.split(",");

    // Extract relevant information
    const name = columns[nameIndex];
    const position = columns[positionIndex];
    const time = new Date(columns[timeIndex]);
    const timeOut = new Date(columns[timeOutIndex]);
    const hoursWorked = parseFloat(columns[hoursWorkedIndex]);

    // Check for conditions
    if (!employees[name]) {
      employees[name] = {
        position,
        shifts: [{ time, timeOut, hoursWorked }],
        consecutiveDays: [time], // Initialize with the first day
        totalHoursWorked: hoursWorked,
      };
    } else {
      const previousShift =
        employees[name].shifts[employees[name].shifts.length - 1];
      const timeDifference = calculateTimeDifference(
        previousShift.timeOut,
        time
      );

      if (timeDifference < 10 && timeDifference > 1) {
        console.log(
          `Employee ${name} (${position}) has less than 10 hours between shifts on ${time}`
        );
      }

      if (time - previousShift.time === 24 * 60 * 60 * 1000) {
        employees[name].shifts.push({ time, timeOut, hoursWorked });
        employees[name].consecutiveDays.push(time);
        employees[name].totalHoursWorked += hoursWorked;
      } else {
        employees[name].shifts = [{ time, timeOut, hoursWorked }];
        employees[name].consecutiveDays = [time]; // Reset consecutive days
        employees[name].totalHoursWorked = hoursWorked;
      }

      if (hoursWorked > 14) {
        console.log(
          `Employee ${name} (${position}) has worked more than 14 hours on ${time}`
        );
      }

      // Check for 7 consecutive days
      if (hasConsecutiveDays(employees[name].consecutiveDays, 7)) {
        console.log(
          `Employee ${name} (${position}) has worked for 7 consecutive days starting from ${employees[name].consecutiveDays[0]}`
        );
      }
    }
  });
}

// Example usage
const filePath = "./Assignment_Timecard.csv";
analyzeFile(filePath);
