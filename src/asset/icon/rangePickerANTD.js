const { DatePicker, Space } = antd;

const { RangePicker } = DatePicker;

function onChange(dates, dateStrings) {
  console.log("From: ", dates[0], ", to: ", dates[1]);
  console.log("From: ", dateStrings[0], ", to: ", dateStrings[1]);
}

ReactDOM.render(
  <Space direction="vertical" size={12}>
    <RangePicker
      ranges={{
        Today: [moment(), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "This week": [moment().startOf("week"), moment().endOf("week")],
        "Last Week": [
          moment().startOf("week").subtract(7, "days"),
          moment().endOf("week").subtract(7, "days"),
        ],
        "Last month": [
          moment().startOf("month").subtract(30, "days"),
          moment().endOf("month").subtract(30, "days"),
        ],
      }}
      onChange={onChange}
    />
    <RangePicker
      ranges={{
        Today: [moment(), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
      }}
      showTime
      format="YYYY/MM/DD HH:mm:ss"
      onChange={onChange}
    />
  </Space>,
  mountNode
);
