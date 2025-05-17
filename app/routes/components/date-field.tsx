import { Box, Popover, TextField, Icon, Card, DatePicker } from "@shopify/polaris";
import { useEffect, useState, forwardRef, useRef } from "react";
import { CalendarIcon } from '@shopify/polaris-icons';

const DateField = forwardRef<HTMLDivElement>((props, ref) => {
  // Get tomorrow's date as the minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const [visible, setVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [{ month, year }, setDate] = useState({
    month: selectedDate.getMonth(),
    year: selectedDate.getFullYear(),
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Format date in YYYY-MM-DD format using the user's locale
  const formattedValue = selectedDate.toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setVisible(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  function handleInputValueChange() {
    console.log("handleInputValueChange");
  }
  function handleOnClose() {
    setVisible(false);
  }
  function handleMonthChange(month: number, year: number) {
    setDate({ month, year });
  }
  function handleDateSelection({ end: newSelectedDate }: { end: Date }) {
    // Ensure the selected date is not before tomorrow
    const selectedDate = new Date(newSelectedDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate >= tomorrow) {
      setSelectedDate(selectedDate);
      setVisible(false);
    }
  }
  useEffect(() => {
    if (selectedDate) {
      setDate({
        month: selectedDate.getMonth(),
        year: selectedDate.getFullYear(),
      });
    }
  }, [selectedDate]);
  return (
    <Box minWidth="276px">
      <Box ref={containerRef} width="100%">
        <Popover
          active={visible}
          autofocusTarget="none"
          preferredAlignment="left"
          fullWidth
          preferInputActivator={false}
          preferredPosition="below"
          preventCloseOnChildOverlayClick
          onClose={handleOnClose}
          activator={
            <TextField
              role="combobox"
              label={"Start date"}
              prefix={<Icon source={CalendarIcon} />}
              value={formattedValue}
              onFocus={() => setVisible(true)}
              onChange={handleInputValueChange}
              autoComplete="off"
            />
          }
        >
          <Box ref={ref}>
            <Card>
              <DatePicker
                month={month}
                year={year}
                selected={selectedDate}
                onMonthChange={handleMonthChange}
                onChange={handleDateSelection}
                disableDatesBefore={tomorrow}
              />
            </Card>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
});

DateField.displayName = 'DateField';

export default DateField;