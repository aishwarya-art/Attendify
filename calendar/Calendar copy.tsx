import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface AttendanceRecord {
  attendance_date: string;
  first_check_in?: string;
  last_check_in?: string;
}

interface CalendarProps {
  attendanceData: AttendanceRecord[];
  selectedDate: Date | null;
  holidays: string[];
  onDateClick: (date: Date) => void;
  updateStats: (workingDays: number, presentDays: number, absentDays: number, holidayDays: number) => void;
  fetchHolidays: (year: number, month: number) => Promise<void>;
}

const Calendar: React.FC<CalendarProps> = ({ attendanceData, selectedDate, holidays, onDateClick, updateStats, fetchHolidays }) => {
  const [daysInMonth, setDaysInMonth] = useState<(Date | null)[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    generateDaysInMonth(year, month);
    fetchHolidays(year, month + 1); // Ensure holidays are fetched for the current month
  }, [year, month, attendanceData, holidays]);

  useEffect(() => {
    if (selectedDate) {
      setMonth(selectedDate.getMonth());
      setYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  const generateDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days: (Date | null)[] = [];
    const today = new Date();

    const firstDayOfWeek = date.getDay();
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    setDaysInMonth(days);
    calculateMonthlyStats(days, attendanceData, holidays, today, year, month);
  };

  const calculateMonthlyStats = (days: (Date | null)[], attendanceData: AttendanceRecord[], holidays: string[], today: Date, year: number, month: number) => {
    const workingDays = days.filter(day => day && day.getDay() !== 0 && !holidays.includes(day.toISOString().split('T')[0]) && (day <= today || (year !== today.getFullYear() || month !== today.getMonth()))).length;
    const presentDays = days.filter(day => {
      if (day && (day <= today || (year !== today.getFullYear() || month !== today.getMonth()))) {
        const utcDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
        const dateString = utcDate.toISOString().split('T')[0];
        return attendanceData.some(record => record.attendance_date === dateString && record.first_check_in && record.last_check_in);
      }
      return false;
    }).length;

    const holidayDays = days.filter(day => {
      if (day) {
        const dayString = day.toISOString().split('T')[0];
        return holidays.includes(dayString) && (day <= today || (year !== today.getFullYear() || month !== today.getMonth()));
      }
      return false;
    }).length;

    const adjustedWorkingDays = workingDays - holidayDays;
    const absentDays = adjustedWorkingDays - presentDays;

    updateStats(adjustedWorkingDays, presentDays, absentDays, holidayDays);

    console.log(`Working Days: ${adjustedWorkingDays}`);
    console.log(`Present Days: ${presentDays}`);
    console.log(`Absent Days: ${absentDays}`);
    console.log(`Holiday Days: ${holidayDays}`);
  };

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (month < today.getMonth() || year < today.getFullYear()) {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  const getStatusForDate = (date: Date | null): string => {
    if (!date) return '';

    const today = new Date();

    if (date > today) return 'future';

    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dateString = utcDate.toISOString().split('T')[0];
    const attendanceRecord = attendanceData.find(record => record.attendance_date === dateString);

    if (holidays.includes(dateString)) {
      return 'holiday';
    }

    if (attendanceRecord) {
      if (attendanceRecord.first_check_in && attendanceRecord.last_check_in) {
        return 'present';
      } else if (attendanceRecord.first_check_in) {
        return 'in-progress';
      }
    }
    return date.getDay() !== 0 ? 'absent' : '';
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    const status = getStatusForDate(date);
    if (date <= today && date.getDay() !== 0 && status !== 'absent') {
      onDateClick(date);
    }
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity style={styles.button} onPress={handlePreviousMonth}>
          <Text><FaArrowLeft /></Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{new Date(year, month).toLocaleString('default', { month: 'long' })} {year}</Text>
        {!(month === new Date().getMonth() && year === new Date().getFullYear()) && (
          <TouchableOpacity style={styles.button} onPress={handleNextMonth}>
            <Text><FaArrowRight /></Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.calendarGrid}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
          <View key={dayName} style={styles.calendarDayName}>
            <Text>{dayName}</Text>
          </View>
        ))}
        {daysInMonth.map((day, index) => {
          const isSunday = day && day.getDay() === 0;
          const isToday = day && day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
          const status = getStatusForDate(day);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                isSunday && styles.sunday,
                isToday && styles.today,
                isSelected && styles.selected,
              ]}
              onPress={() => day && handleDateClick(day)}
            >
              <Text>{day ? day.getDate() : ''}</Text>
              {status === 'present' && <View style={styles.dotPresent} />}
              {status === 'holiday' && <View style={styles.dotHoliday} />}
              {status === 'absent' && <View style={styles.dotAbsent} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
    padding: 0,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: 10,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginRight: -10,
  },
  calendarDayName: {
    width: '12.5%',
    alignItems: 'center',
  },
  calendarDay: {
    width: '12.5%',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  dotPresent: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'green',
  },
  dotAbsent: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  dotHoliday: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'orange',
  },
  sunday: {
    backgroundColor: '#ffffff',
    color: '#aaa',
  },
  today: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  selected: {
    backgroundColor: '#b3e5fc',
  },
});

export default Calendar;
