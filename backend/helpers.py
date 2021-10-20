import datetime as d

def get_current_time():
    #  return d.datetime.now().strftime("%Y%m%d%H")
    return d.datetime.now().replace(microsecond=0, second=0, minute=0)