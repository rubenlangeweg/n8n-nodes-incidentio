#!/usr/bin/env node

/**
 * Test script for on-call holiday conflict detection
 * Run with: node test-conflict-detection.js
 */

// Sample data from Productive - Bookings
const sampleBookings = {
  data: [
    {
      id: "24733764",
      type: "bookings",
      attributes: {
        started_on: "2025-10-01",
        ended_on: "2025-10-15",
        note: "Vacation",
        approved: true
      },
      relationships: {
        person: {
          data: {
            type: "people",
            id: "12345"
          }
        }
      }
    },
    {
      id: "24733765",
      type: "bookings",
      attributes: {
        started_on: "2025-10-20",
        ended_on: "2025-10-25",
        note: "Personal leave",
        approved: true
      },
      relationships: {
        person: {
          data: {
            type: "people",
            id: "12346"
          }
        }
      }
    }
  ]
};

// Sample data from Productive - People
const samplePeople = {
  data: [
    {
      id: "12345",
      type: "people",
      attributes: {
        name: "Carlo Kok",
        email: "carlo@rb2.nl"
      }
    },
    {
      id: "12346",
      type: "people",
      attributes: {
        name: "Ruben",
        email: "ruben@rb2.nl"
      }
    }
  ]
};

// Sample data from incident.io - Schedule Entries
const sampleScheduleEntries = {
  schedule_entries: {
    final: [
      {
        rotation_id: "01JRT07TGJP1JFZGTKKYKT1AE9",
        user: {
          id: "01J6YN3TXJ0H3TZBMKGZMWG9N8",
          name: "Carlo Kok",
          email: "carlo@rb2.nl",
          slack_user_id: "U07KUE9N4EP",
          role: "responder"
        },
        start_at: "2025-10-01T06:00:00Z",
        end_at: "2025-10-01T20:00:00Z",
        fingerprint: "179a7cdc3f142227feeff9c6491bd392"
      },
      {
        rotation_id: "01JRT07TGJP1JFZGTKKYKT1AE9",
        user: {
          id: "01J6YN3TXJ0H3TZBMKGZMWG9N8",
          name: "Carlo Kok",
          email: "carlo@rb2.nl",
          slack_user_id: "U07KUE9N4EP",
          role: "responder"
        },
        start_at: "2025-10-02T06:00:00Z",
        end_at: "2025-10-02T20:00:00Z",
        fingerprint: "bfc59a72736bc07c5dc0253043488e0f"
      },
      {
        rotation_id: "01JRT07TGJP1JFZGTKKYKT1AE9",
        user: {
          id: "01JPQFHQ1A78FM86SR8AP32AJ1",
          name: "Ruben",
          email: "ruben@rb2.nl",
          slack_user_id: "U07UG961280",
          role: "responder"
        },
        start_at: "2025-10-06T06:00:00Z",
        end_at: "2025-10-06T20:00:00Z",
        fingerprint: "9caf0a5a127e8287d5aaa476ad30eef8"
      },
      {
        rotation_id: "01JRT07TGJP1JFZGTKKYKT1AE9",
        user: {
          id: "01JPQFHQ1A78FM86SR8AP32AJ1",
          name: "Ruben",
          email: "ruben@rb2.nl",
          slack_user_id: "U07UG961280",
          role: "responder"
        },
        start_at: "2025-10-22T06:00:00Z",
        end_at: "2025-10-22T20:00:00Z",
        fingerprint: "f14e32f3cb544493bc16080778a89a4d"
      }
    ]
  }
};

// ============================================
// CONFLICT DETECTION LOGIC (from n8n Code node)
// ============================================

function detectConflicts(bookingsData, peopleData, scheduleData) {
  const bookings = bookingsData?.data || [];
  const people = peopleData?.data || [];

  // Extract schedule entries (use final to include overrides, fallback to scheduled)
  const scheduleEntries = scheduleData.schedule_entries?.final ||
                          scheduleData.schedule_entries?.scheduled ||
                          scheduleData.scheduled ||
                          [];

  console.log('\n📊 Input Data:');
  console.log(`- Bookings: ${bookings.length}`);
  console.log(`- People: ${people.length}`);
  console.log(`- Schedule Entries: ${scheduleEntries.length}`);

  // Create a map of people by email
  const peopleByEmail = {};
  people.forEach(person => {
    const email = person.attributes?.email;
    if (email) {
      peopleByEmail[email.toLowerCase()] = person;
    }
  });

  console.log(`\n👥 People mapped by email:`, Object.keys(peopleByEmail));

  // Create a map of bookings by person ID (only approved bookings)
  const bookingsByPersonId = {};
  bookings.forEach(booking => {
    // Only include approved bookings (not rejected or canceled)
    const attrs = booking.attributes;
    if (attrs.approved && !attrs.rejected && !attrs.canceled) {
      const personId = booking.relationships?.person?.data?.id;
      if (personId) {
        if (!bookingsByPersonId[personId]) {
          bookingsByPersonId[personId] = [];
        }
        bookingsByPersonId[personId].push(booking);
      }
    }
  });

  console.log(`\n📅 Bookings by person ID:`, Object.keys(bookingsByPersonId));

  // Helper: Format date
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  }

  // Helper: Format datetime
  function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  }

  // Function to check if date ranges overlap
  function dateRangesOverlap(start1, end1, start2, end2) {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    return s1 <= e2 && s2 <= e1;
  }

  // Group schedule entries by date
  const scheduleByDate = {};
  scheduleEntries.forEach(entry => {
    const date = formatDate(entry.start_at);
    if (!scheduleByDate[date]) {
      scheduleByDate[date] = [];
    }
    scheduleByDate[date].push(entry);
  });

  console.log(`\n📆 Schedule by date:`, Object.keys(scheduleByDate));

  // Find conflicts and build detailed summary
  const conflicts = [];
  const dailySummaries = [];
  const checkedPeople = new Set();

  Object.keys(scheduleByDate).sort().forEach(date => {
    const dayEntries = scheduleByDate[date];
    const dayConflicts = [];
    const onCallPeople = [];

    dayEntries.forEach(entry => {
      const userEmail = entry.user?.email?.toLowerCase();
      if (!userEmail) return;

      checkedPeople.add(entry.user.name);

      // Find matching person in Productive
      const person = peopleByEmail[userEmail];
      const personId = person?.id;
      const personBookings = personId ? (bookingsByPersonId[personId] || []) : [];

      console.log(`\n🔍 Checking ${entry.user.name} (${userEmail})`);
      console.log(`   - Person ID: ${personId}`);
      console.log(`   - Bookings: ${personBookings.length}`);

      // Check for holiday conflicts
      const hasConflict = personBookings.some(booking => {
        const bookingStart = booking.attributes.started_on;
        const bookingEnd = booking.attributes.ended_on;
        const scheduleStart = entry.start_at;
        const scheduleEnd = entry.end_at;

        console.log(`   - Checking booking: ${bookingStart} to ${bookingEnd}`);
        console.log(`   - Against schedule: ${scheduleStart} to ${scheduleEnd}`);

        if (dateRangesOverlap(bookingStart, bookingEnd, scheduleStart, scheduleEnd)) {
          console.log(`   ⚠️ CONFLICT FOUND!`);
          conflicts.push({
            date: date,
            person_name: entry.user.name,
            person_email: entry.user.email,
            slack_user_id: entry.user.slack_user_id,
            booking_start: bookingStart,
            booking_end: bookingEnd,
            schedule_start: scheduleStart,
            schedule_end: scheduleEnd,
            booking_note: booking.attributes.note || 'No note',
            rotation_id: entry.rotation_id
          });
          dayConflicts.push(entry.user.name);
          return true;
        }
        return false;
      });

      onCallPeople.push({
        name: entry.user.name,
        email: entry.user.email,
        shift: `${formatDateTime(entry.start_at)} - ${formatDateTime(entry.end_at)}`,
        has_conflict: hasConflict,
        holiday_count: personBookings.length
      });
    });

    dailySummaries.push({
      date: date,
      on_call_count: onCallPeople.length,
      conflict_count: dayConflicts.length,
      on_call_people: onCallPeople,
      conflicts: dayConflicts
    });
  });

  // Build summary message
  let summaryLines = [
    '=== ON-CALL HOLIDAY CONFLICT CHECK ===',
    '',
    `📊 Summary:`,
    `- Total people checked: ${checkedPeople.size}`,
    `- Total bookings (holidays): ${bookings.length}`,
    `- Total schedule entries: ${scheduleEntries.length}`,
    `- Days with on-call shifts: ${Object.keys(scheduleByDate).length}`,
    `- Conflicts found: ${conflicts.length}`,
    ''
  ];

  // Add daily breakdown
  summaryLines.push('📅 Daily Breakdown:');
  dailySummaries.forEach(day => {
    summaryLines.push(`\n${day.date}:`);
    summaryLines.push(`  On-call: ${day.on_call_count} person(s)`);

    day.on_call_people.forEach(person => {
      const status = person.has_conflict ? '⚠️ CONFLICT' : '✅ OK';
      summaryLines.push(`    - ${person.name} (${person.shift}) ${status}`);
      if (person.holiday_count > 0) {
        summaryLines.push(`      Has ${person.holiday_count} holiday booking(s)`);
      }
    });
  });

  // Add conflict details
  if (conflicts.length > 0) {
    summaryLines.push('\n⚠️ CONFLICTS DETECTED:');
    conflicts.forEach((conflict, idx) => {
      summaryLines.push(`\n${idx + 1}. ${conflict.person_name} (${conflict.person_email})`);
      summaryLines.push(`   Holiday: ${conflict.booking_start} to ${conflict.booking_end}`);
      summaryLines.push(`   On-call: ${formatDateTime(conflict.schedule_start)} to ${formatDateTime(conflict.schedule_end)}`);
      summaryLines.push(`   Note: ${conflict.booking_note}`);
    });
  } else {
    summaryLines.push('\n✅ No conflicts detected - all on-call schedules are clear!');
  }

  const summary = summaryLines.join('\n');

  return {
    summary: summary,
    has_conflicts: conflicts.length > 0,
    conflict_count: conflicts.length,
    total_people_checked: checkedPeople.size,
    total_bookings: bookings.length,
    total_schedule_entries: scheduleEntries.length,
    daily_summaries: dailySummaries,
    conflicts: conflicts
  };
}

// ============================================
// RUN TEST
// ============================================

console.log('\n🚀 Starting conflict detection test...\n');

const result = detectConflicts(sampleBookings, samplePeople, sampleScheduleEntries);

console.log('\n\n' + '='.repeat(80));
console.log('FINAL RESULT:');
console.log('='.repeat(80));
console.log(result.summary);
console.log('\n' + '='.repeat(80));
console.log('\n📦 Full Result Object:');
console.log(JSON.stringify(result, null, 2));
